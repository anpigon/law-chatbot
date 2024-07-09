import os
import pickle

import numpy as np
import torch
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kiwipiepy import Kiwi
from langchain.callbacks.base import BaseCallbackHandler
from langchain.prompts import ChatPromptTemplate
from langchain.retrievers import EnsembleRetriever
from langchain.schema import Document
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

load_dotenv()

os.environ["TOKENIZERS_PARALLELISM"] = "false"

app = FastAPI()


FAISS_DB_INDEX = "./law-bot/index_faiss"
BM25_INDEX = "./law-bot/index_bm25/bm25_kiwi_retriever.pkl"


class Query(BaseModel):
    question: str


class StreamCallback(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs):
        print(token, end="", flush=True)


def kiwi_tokenize(text):
    kiwi = Kiwi()
    return [token.form for token in kiwi.tokenize(text)]


def load_bm25_retriever():
    with open(BM25_INDEX, "rb") as f:
        bm25_retriever = pickle.load(f)
    return bm25_retriever


def load_faiss_retriever(embeddings):
    faiss_db = FAISS.load_local(
        FAISS_DB_INDEX, embeddings, allow_dangerous_deserialization=True
    )
    faiss_retriever = faiss_db.as_retriever(search_type="mmr", search_kwargs={"k": 3})
    return faiss_retriever


def load_retrievers(embeddings):
    faiss_retriever = load_faiss_retriever(embeddings).with_config(run_name="faiss")
    bm25_retriever = load_bm25_retriever().with_config(run_name="bm25")
    return EnsembleRetriever(
        retrievers=[bm25_retriever, faiss_retriever],
        weights=[0.7, 0.3],
        search_type="mmr",
    )


def get_device():
    if torch.cuda.is_available():
        return "cuda:0"
    elif torch.backends.mps.is_available():
        return "mps"
    else:
        return "cpu"


# 임베딩 모델 설정
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": get_device()},
    encode_kwargs={"normalize_embeddings": True},
)

retriever = load_retrievers(embeddings)

prompt_template = """당신은 판사이자 20년 차 법률 전문가입니다. 주어진 질문에 대해 문서의 정보를 최대한 활용하여 답변하세요. 질문자는 자신의 상황을 설명할 것이며, 질문자의 상황과 비슷한 판례를 설명해줘야 합니다. 가장 최근 사건 순으로 소개하며, 초등학생이 이해할 수 있도록 최대한 자세하고 쉽게 설명하세요. 
답변은 [사건명 1] : 사건명, 사건번호, ... [내용 설명], ... [출처] 형식으로 3가지 사례를 설명합니다. 문서에서 답변을 찾을 수 없는 경우, "문서에 답변이 없습니다."라고 답변하세요. 사건번호 또는 사건명이 입력되는 경우는 해당 사건에 대한 문서 내용을 설명해야 합니다.  SHOULD return your answer in markdown with clear headings and lists. 

답변의 출처(source)를 반드시 표기합니다. 출처는 메타데이터의 판례일련번호, 사건명, 사건번호 순으로 표기합니다. 또한, 출처에 하일라이트가 포함된 하이퍼링크가 포함되도록 하세요. URL형태는 `https://www.law.go.kr/LSW/precInfoP.do?precSeq={{precSeq}}` 입니다.
---

# 주어진 문서:
{context}

# 질문: {question}

# 답변:
"""

prompt = ChatPromptTemplate.from_messages(
    [("system", prompt_template), ("human", "{question}")]
)

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    streaming=True,
    verbose=True,
    callbacks=[StreamCallback()],
)

output_parser = StrOutputParser()

runnable = RunnablePassthrough.assign(context=lambda x: retriever.invoke(x["question"]))

chain = runnable | prompt | llm | output_parser


def rag_chain(question: str) -> str:
    return chain.invoke({"question": question})


@app.post("/query")
async def query_endpoint(query: Query):
    try:
        answer = rag_chain(query.question)
        return {"answer": answer}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5002)
