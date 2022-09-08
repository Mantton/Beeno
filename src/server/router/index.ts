// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'
import { artistRouter } from './artist'
import { collectorRouter, protectedCollectorRouter } from './collector'
import { imageRouter } from './image'
import { labelRouter } from './label'
import { groupRouter } from './group'

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('artist.', artistRouter)
    .merge('collector.', collectorRouter)
    .merge('protectedCollector.', protectedCollectorRouter)
    .merge('image.', imageRouter)
    .merge('label.', labelRouter)
    .merge('group.', groupRouter)

// export type definition of API
export type AppRouter = typeof appRouter
