import Layout from '@/components/layout'
import Login from '@/components/login'

export default function LoginPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Log In to Your Account</h1>
        <Login />
      </div>
    </Layout>
  )
}