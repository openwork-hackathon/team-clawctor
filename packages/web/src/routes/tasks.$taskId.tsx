import { createFileRoute } from '@tanstack/react-router'
import { TaskDetailsPage } from '../pages/TaskDetailsPage'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailsPage,
})
