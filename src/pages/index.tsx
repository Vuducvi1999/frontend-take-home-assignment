import type { TodoStatusSchema } from '@/server/api/schemas/todo-schemas'
import type { z } from 'zod'

import * as Tabs from '@radix-ui/react-tabs'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import { CreateTodoForm } from '@/client/components/CreateTodoForm'
import { TodoList } from '@/client/components/TodoList'
import { api } from '@/utils/client/api'

/**
 * QUESTION 6:
 * -----------
 * Implement quick filter/tab feature so that we can quickly find todos with
 * different statuses ("pending", "completed", or both). The UI should look like
 * the design on Figma.
 *
 * NOTE:
 *  - For this question, you must use RadixUI Tabs component. Its Documentation
 *  is linked below.
 *
 * Documentation references:
 *  - https://www.radix-ui.com/docs/primitives/components/tabs
 */

type TodoStatus = z.infer<typeof TodoStatusSchema> | 'all'

const Index = () => {
  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })

  const [parent] = useAutoAnimate({
    duration: 500,
    easing: 'steps(6)',
  })

  return (
    <main className="mx-auto w-[480px] pt-12">
      <div className="rounded-12 bg-white p-8 shadow-sm">
        <h1 className="text-center text-4xl font-extrabold text-gray-900">
          Todo App
        </h1>

        <Tabs.Root defaultValue="all" orientation="vertical" className="pt-10">
          <Tabs.List>
            <ContentTab status="all" />
            <ContentTab status="pending" />
            <ContentTab status="completed" />
          </Tabs.List>
          <Tabs.Content value="all" ref={parent}>
            <div className="pt-10">
              <TodoList data={todos} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="pending" ref={parent}>
            <div className="pt-10">
              <TodoList
                data={todos.filter(({ status }) => status === 'pending')}
              />
            </div>
          </Tabs.Content>
          <Tabs.Content value="completed" ref={parent}>
            <div className="pt-10">
              <TodoList
                data={todos.filter(({ status }) => status === 'completed')}
              />
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <div className="pt-10">
          <CreateTodoForm />
        </div>
      </div>
    </main>
  )
}

const ContentTab = ({ status }: { status: TodoStatus }) => {
  return (
    <Tabs.Trigger
      value={status}
      className={`mr-2 rounded-full border px-6 py-3 font-sans text-sm font-bold capitalize
      ${'data-[state=active]:bg-gray-700 data-[state=active]:text-white'}
      ${'data-[state=inactive]:border-gray-200 data-[state=inactive]:text-gray-700'}`}
    >
      {status}
    </Tabs.Trigger>
  )
}

export default Index
