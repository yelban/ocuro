import { buildUrl } from '@/utils/buildUrl'
import Head from 'next/head'
export const Meta = () => {
  const title = 'Ocuro'
  const description = 'BCQ中醫體質問卷AI機器人'
  const imageUrl = '/extension_icon.png'
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  )
}
