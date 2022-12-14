import { getSingleSchema, NormalizerMore, useFetch, useQuery, useXSWR } from "@hazae41/xswr";
import { useCallback } from "react";
import { fetchAsJson } from "../../src/fetcher";
import { getProfileRef, getProfileSchema, Profile, ProfileData, ProfileRef } from "./profile";

export interface CommentRef {
  ref: true
  id: string
}

export interface CommentData {
  id: string,
  author: ProfileData,
  text: string
}

export interface NormalizedCommentData {
  id: string,
  author: ProfileRef,
  text: string
}

export function getCommentSchema(id: string) {
  async function normalizer(comment: CommentData | NormalizedCommentData, more: NormalizerMore) {
    const author = await getProfileRef(comment.author, more)
    return { ...comment, author }
  }

  return getSingleSchema<CommentData | NormalizedCommentData>(
    `/api/theytube/comment?id=${id}`,
    fetchAsJson<CommentData>,
    { normalizer })
}

export async function getCommentRef(comment: CommentData | CommentRef, more: NormalizerMore) {
  if ("ref" in comment) return comment
  const schema = getCommentSchema(comment.id)
  await schema.normalize(comment, more)
  return { ref: true, id: comment.id } as CommentRef
}

export function useComment(id: string) {
  const handle = useQuery(getCommentSchema, [id])
  useFetch(handle)
  return handle
}

export function Comment(props: { id: string }) {
  const { make } = useXSWR()
  const comment = useComment(props.id)

  const onChangeAuthorClick = useCallback(() => {
    if (!comment.data) return

    const John69 = make(getProfileSchema("1518516160"))
    if (!John69.state) return

    const author = John69.state.data!

    comment.mutate(c => c && ({ data: c.data && ({ ...c.data, author }) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.data, comment.mutate])

  if (!comment.data) return null

  return <div className="p-4 border border-solid border-gray-500">
    <Profile id={comment.data.author.id} />
    <pre className="whitespace-pre-wrap">
      {comment.data.text}
    </pre>
    <button onClick={onChangeAuthorClick}>
      Change author
    </button>
  </div>
}

export default function Page() {
  return null
}