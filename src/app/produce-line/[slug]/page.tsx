import { use } from 'react'
import ProductionLineClient from './client'

type PageProps = {
    params: Promise<{
        slug: string
    }>
}

export default function ProductionLinePage({ params }: PageProps) {
    const resolvedParams = use(params)
    const componentName = decodeURIComponent(resolvedParams.slug)

    return <ProductionLineClient componentName={componentName} />
} 