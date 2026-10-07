import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export default function Board({ tasks, onMove, onUpdate, onDelete }) {
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    onMove(draggableId, destination.droppableId, destination.index)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] rounded-2xl p-4 transition ${
                    snapshot.isDraggingOver ? 'bg-slate-800' : 'bg-slate-900'
                  }`}
                >
                  <h2 className="mb-3 flex items-center justify-between font-semibold">
                    {col.title}
                    <span className="rounded-full bg-slate-800 px-2 text-xs text-slate-400">
                      {colTasks.length}
                    </span>
                  </h2>
                  {colTasks.map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="mb-3"
                        >
                          <TaskCard
                            task={task}
                            dragging={snap.isDragging}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {colTasks.length === 0 && (
                    <p className="text-sm text-slate-500">Drop tasks here</p>
                  )}
                </div>
              )}
            </Droppable>
          )
        })}
      </div>
    </DragDropContext>
  )
}