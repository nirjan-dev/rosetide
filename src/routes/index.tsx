import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center py-4 px-2">
      <h1 className='font-bold text-2xl my-2'>Welcome to Periodos</h1>
      <button className='btn'>Get started</button>
   </div>
  )
}
