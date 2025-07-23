import settingsStore from '@/features/stores/settings'

export const AssistantText = ({ message }: { message: string }) => {
  const characterName = settingsStore((s) => s.characterName)
  const showCharacterName = settingsStore((s) => s.showCharacterName)

  return (
    // <div className="absolute bottom-0 left-0 md:mb-[240px] mb-[200px] w-full z-20">
    <div className="fixed top-[52%] left-0 right-0 mx-16 z-5">
      {/* <div className="mx-auto max-w-4xl w-full p-16"> */}
      <div className="w-1/2">
        {/* <div className=""> */}
        <div className="floating-askprofile-inner pr-8">
          {showCharacterName && (
            <div className="px-[2rem] py-8 w-fit bg-secondary rounded-t-8 text-white font-bold tracking-wider rounded-8 mb-8">
              {characterName}
            </div>
          )}
          <div className="px-[2rem] py-16 bg-white rounded-8">
            <div className="line-clamp-4 text-secondary text-[1.25rem] font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
