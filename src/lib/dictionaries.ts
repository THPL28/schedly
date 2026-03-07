
const dictionaries: { [key: string]: () => Promise<any> } = {
    en: () => import('@/messages/en.json').then((module) => module.default),
    pt: () => import('@/messages/pt.json').then((module) => module.default),
}

export const getDictionary = async (locale: any) => {
    // default to pt-BR if not found
    if (!dictionaries[locale]) {
        return dictionaries['pt']()
    }
    return dictionaries[locale]()
}
