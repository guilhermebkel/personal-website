import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1>Nothing here. I probably moved it.</h1>
      <p>
        <Link href="/">Back home</Link>
        {" · "}
        <Link href="/blog/">See posts</Link>
      </p>
    </div>
  );
};

export default NotFoundPage;
