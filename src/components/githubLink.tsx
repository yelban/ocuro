import Image from 'next/image'
import { buildUrl } from '@/utils/buildUrl'

export const GitHubLink = () => {
  return (
    <div className="absolute right-0 z-15 m-24">
      <a
        draggable={false}
        href="https://github.com/yelban/ocuro"
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="p-8 rounded-16 bg-[#1F2328] hover:bg-[#33383E] active:bg-[565A60] flex">
          <Image
            alt="GitHub Repository Link"
            height={24}
            width={24}
            src={buildUrl('/github-mark-white.svg')}
          />
          <div className="mx-4 text-white font-bold">Fork me</div>
        </div>
      </a>
    </div>
  )
}
