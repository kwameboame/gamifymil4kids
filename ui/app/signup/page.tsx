import Layout from '@/components/layout'
import Signup from '@/components/signup'

export default function SignupPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
        <Signup />
      </div>
    </Layout>
  )
}