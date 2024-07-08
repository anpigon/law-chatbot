export const Loading: React.FC = () => (
  <div className="mb-4 flex justify-start last:mb-0">
    <div>
      <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-100 px-4 py-2">
        <div className="flex justify-center">
          <div className="loader-dots relative mt-3 block h-5 w-20">
            <div className="absolute h-3 w-3 rounded-full bg-gray-500"></div>
            <div className="absolute h-3 w-3 rounded-full bg-gray-500"></div>
            <div className="absolute h-3 w-3 rounded-full bg-gray-500"></div>
            <div className="absolute h-3 w-3 rounded-full bg-gray-500"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
