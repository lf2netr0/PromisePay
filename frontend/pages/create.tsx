import Layout from "../components/layout"
import CreatePromiseForm from "../components/createPromiseForm"
import { useSession } from "next-auth/react"
import AccessDenied from "../components/access-denied"
export default function ClientPage() {

  const { data: session } = useSession()
  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }
  return (
    <Layout>

      <CreatePromiseForm>

      </CreatePromiseForm></Layout>
  )
}
