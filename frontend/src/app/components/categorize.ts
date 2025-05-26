export type CategoryItem = {
    id: number;
    name: string;
    parentId: number | null;
};

export type CategoryTree = CategoryItem & {
    children: CategoryTree[];
};

export function buildCategoryTree(flat: CategoryItem[]): CategoryTree[] {
    const map = new Map<number, CategoryTree>();
    const roots: CategoryTree[] = [];

    for (const item of flat) {
        map.set(item.id, { ...item, children: [] });
    }

    for (const item of flat) {
        const node = map.get(item.id)!;
        if (item.parentId) {
            const parent = map.get(item.parentId);
            parent?.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}
