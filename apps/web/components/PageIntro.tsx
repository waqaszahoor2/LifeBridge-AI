export function PageIntro({ title, description }: { title: string; description: string }) {
  return <section className="page-intro"><h2>{title}</h2><p>{description}</p></section>;
}
