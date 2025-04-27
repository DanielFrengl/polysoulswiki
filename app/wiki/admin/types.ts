export type ViewModesAdmin = 
    "categories" | "categoryPages" | "allPages" | "editCategory";

export interface WikiCategories {
    id: string,
    name: string,
    slug: string,
    description?: string,
    hasPages?: string[],
}