import { Hono } from "hono"



const users = [
  {
    id: 1,
    name: 'nirjan'
  },
  {
    id: 2,
    name: 'neha'
  }
]
const usersRoute = new Hono().get('/', c => {
  return c.json({
    users
  }, 200)
}).get('/:id', c => {
  const id = c.req.param('id')

  const user = users.find(user => user.id === parseInt(id))

  return c.json({
    user
  }, 200)
})


export default usersRoute
