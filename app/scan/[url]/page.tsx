import { RedirectComponent } from './redirect'

export default function ScanPage({ 
  params 
}: { 
  params: { url: string } 
}) {
  const decodedUrl = decodeURIComponent(params.url)

  return <RedirectComponent url={decodedUrl} />
} 