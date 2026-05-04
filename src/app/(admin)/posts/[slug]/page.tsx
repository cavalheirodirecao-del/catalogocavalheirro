import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "../_components/PostEditor";

interface Props {
  params: { slug: string };
}

export default async function EditarPostPage({ params }: Props) {
  const post = await prisma.postBlog.findUnique({ where: { id: params.slug } });
  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        titulo: post.titulo,
        slug: post.slug,
        resumo: post.resumo,
        conteudo: post.conteudo,
        imagemCapa: post.imagemCapa,
        autor: post.autor,
        publicado: post.publicado,
        destaque: post.destaque,
        palavrasChave: post.palavrasChave,
      }}
    />
  );
}
