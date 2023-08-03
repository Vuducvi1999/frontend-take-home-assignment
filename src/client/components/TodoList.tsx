import type { Dispatch, SVGProps, SetStateAction } from 'react'
import type { z } from 'zod'
import type { TodoStatusSchema } from '@/server/api/schemas/todo-schemas'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'

import { api } from '@/utils/client/api'

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

type TodoStatus = z.infer<typeof TodoStatusSchema> | 'all'

export const TodoList = () => {
  const [status, setStatus] = useState('all' as TodoStatus)
  const [parent] = useAutoAnimate({
    duration: 1000,
  })

  const apiContext = api.useContext()
  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })

  const { mutate: deleteItem } = api.todo.delete.useMutation({
    onSuccess: () => apiContext.todo.getAll.refetch(),
  })
  const { mutate: updateItem } = api.todoStatus.update.useMutation({
    onSuccess: () => apiContext.todo.getAll.refetch(),
  })

  const filteredItems = (status: TodoStatus) =>
    status === 'all' ? todos : todos.filter((todo) => todo.status === status)

  return (
    <>
      <div className="flex">
        <StatusTag
          setStatus={setStatus}
          status="all"
          checked={status === 'all'}
        />
        <StatusTag
          setStatus={setStatus}
          status="pending"
          checked={status === 'pending'}
        />
        <StatusTag
          setStatus={setStatus}
          status="completed"
          checked={status === 'completed'}
        />
      </div>

      <ul className="grid grid-cols-1 gap-y-3 pt-10" ref={parent}>
        {filteredItems(status).map((item) => (
          <li key={item.id}>
            <div
              className={`${
                item.status === 'completed' && 'bg-gray-50'
              } flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm`}
            >
              <Checkbox.Root
                id={String(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                onClick={() =>
                  updateItem({
                    todoId: item.id,
                    status:
                      item.status === 'completed' ? 'pending' : 'completed',
                  })
                }
                checked={item.status === 'completed'}
              >
                <Checkbox.Indicator>
                  <CheckIcon
                    className="h-4 w-4 text-white"
                    onClick={() =>
                      updateItem({
                        todoId: item.id,
                        status:
                          item.status === 'completed' ? 'pending' : 'completed',
                      })
                    }
                  />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <label
                className={`block flex-grow pl-3 font-medium ${
                  item.status === 'completed' &&
                  'font-medium text-gray-500 line-through'
                }`}
                htmlFor={String(item.id)}
              >
                {item.body}
              </label>
              <XMarkIcon
                className="h-6 w-6"
                onClick={() => deleteItem({ id: item.id })}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

const StatusTag = ({
  status,
  setStatus,
  checked,
}: {
  checked: boolean
  status: TodoStatus
  setStatus: Dispatch<SetStateAction<TodoStatus>>
}) => {
  return (
    <div
      className={`mr-2 rounded-full border px-6 py-3 font-sans text-sm font-bold capitalize ${
        checked ? 'bg-gray-700 text-white' : ' border-gray-200 text-gray-700'
      }`}
      onClick={() => setStatus(status)}
    >
      {status}
    </div>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
