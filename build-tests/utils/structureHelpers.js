// src/utils/structureHelpers.ts
// Fonctions utilitaires pour manipuler les structures de matières
/**
 * Trouve une notion par son ID dans la structure
 */
export function findNotion(structure, notionId) {
    for (const chapter of structure.chapters) {
        for (const section of chapter.sections) {
            for (const subsection of section.subsections) {
                const notion = subsection.notions.find(n => n.id === notionId);
                if (notion)
                    return notion;
            }
        }
    }
    // Chercher aussi dans les cross-cutting items si nécessaire
    if (structure.crossCutting) {
        const categories = [
            structure.crossCutting.formulas,
            structure.crossCutting.authors,
            structure.crossCutting.organizations,
            structure.crossCutting.concepts
        ].filter(Boolean);
        for (const category of categories) {
            // Les items cross-cutting ne sont pas des notions, mais on peut les traiter comme tels
            // pour certaines opérations (à implémenter si nécessaire)
        }
    }
    return undefined;
}
/**
 * Récupère toutes les notions d'un chapitre
 */
export function getChapterNotions(structure, chapterId) {
    const chapter = structure.chapters.find(c => c.id === chapterId);
    if (!chapter)
        return [];
    const notions = [];
    for (const section of chapter.sections) {
        for (const subsection of section.subsections) {
            notions.push(...subsection.notions);
        }
    }
    return notions;
}
/**
 * Récupère toutes les notions d'une matière (flat list)
 */
export function getAllNotions(structure) {
    const notions = [];
    for (const chapter of structure.chapters) {
        for (const section of chapter.sections) {
            for (const subsection of section.subsections) {
                notions.push(...subsection.notions);
            }
        }
    }
    return notions;
}
/**
 * Filtre les notions par tags (OR logic - au moins un tag correspond)
 */
export function filterNotionsByTags(structure, tags) {
    if (!tags || tags.length === 0)
        return getAllNotions(structure);
    const allNotions = getAllNotions(structure);
    return allNotions.filter(notion => notion.tags.some(tag => tags.includes(tag)));
}
/**
 * Filtre les notions par difficulté
 */
export function filterNotionsByDifficulty(structure, minDifficulty) {
    const difficultyOrder = ['Facile', 'Moyen', 'Difficile', 'Expert'];
    const minIndex = difficultyOrder.indexOf(minDifficulty);
    if (minIndex === -1)
        return getAllNotions(structure);
    return getAllNotions(structure).filter(notion => {
        const notionIndex = difficultyOrder.indexOf(notion.difficulty);
        return notionIndex >= minIndex;
    });
}
/**
 * Calcule les statistiques de progression pour un ensemble de notions
 */
export function calculateProgressStats(notionIds, progressMap) {
    const total = notionIds.length;
    let mastered = 0;
    let inProgress = 0;
    let newNotions = 0;
    for (const notionId of notionIds) {
        const progress = progressMap.get(notionId);
        if (!progress || progress.masteryLevel === 0) {
            newNotions++;
        }
        else if (progress.masteryLevel === 3) {
            mastered++;
        }
        else {
            inProgress++;
        }
    }
    return {
        totalNotions: total,
        masteredNotions: mastered,
        inProgressNotions: inProgress,
        newNotions,
        percentageComplete: total > 0 ? (mastered / total) * 100 : 0
    };
}
/**
 * Récupère le chemin complet d'une notion (Breadcrumb)
 */
export function getNotionPath(structure, notionId) {
    for (const chapter of structure.chapters) {
        for (const section of chapter.sections) {
            for (const subsection of section.subsections) {
                const notion = subsection.notions.find(n => n.id === notionId);
                if (notion) {
                    return [
                        chapter.name,
                        section.name,
                        subsection.name,
                        notion.name
                    ];
                }
            }
        }
    }
    return [];
}
/**
 * Récupère les notions liées (par IDs)
 */
export function getRelatedNotions(structure, notionId) {
    const notion = findNotion(structure, notionId);
    if (!notion || !notion.relatedNotions)
        return [];
    return notion.relatedNotions
        .map(id => findNotion(structure, id))
        .filter(Boolean);
}
/**
 * Récupère les items cross-cutting associés à une notion
 */
export function getCrossCuttingItemsForNotion(structure, notionId) {
    const notion = findNotion(structure, notionId);
    if (!notion || !structure.crossCutting) {
        return { formulas: [], authors: [], organizations: [] };
    }
    const formulas = notion.relatedFormulas
        ?.map(id => structure.crossCutting?.formulas?.items.find(i => i.id === id))
        .filter(Boolean) || [];
    const authors = notion.relatedAuthors
        ?.map(id => structure.crossCutting?.authors?.items.find(i => i.id === id))
        .filter(Boolean) || [];
    const organizations = notion.relatedOrganizations
        ?.map(id => structure.crossCutting?.organizations?.items.find(i => i.id === id))
        .filter(Boolean) || [];
    return { formulas, authors, organizations };
}
/**
 * Récupère toutes les notions associées à un item cross-cutting
 */
export function getNotionsForCrossCuttingItem(structure, itemId) {
    // Trouver l'item dans toutes les catégories
    const categories = [
        structure.crossCutting?.formulas,
        structure.crossCutting?.authors,
        structure.crossCutting?.organizations,
        structure.crossCutting?.concepts
    ].filter(Boolean);
    let item;
    for (const category of categories) {
        item = category.items.find(i => i.id === itemId);
        if (item)
            break;
    }
    if (!item)
        return [];
    // Récupérer les notions liées
    return item.relatedNotions
        .map(notionId => findNotion(structure, notionId))
        .filter(Boolean);
}
/**
 * Compte le nombre total de questions dans la structure
 */
export function countTotalQuestions(structure) {
    return structure.chapters.reduce((total, chapter) => total + chapter.questionCount, 0);
}
/**
 * Groupe les notions par difficulté
 */
export function groupNotionsByDifficulty(structure) {
    const allNotions = getAllNotions(structure);
    return {
        Facile: allNotions.filter(n => n.difficulty === 'Facile'),
        Moyen: allNotions.filter(n => n.difficulty === 'Moyen'),
        Difficile: allNotions.filter(n => n.difficulty === 'Difficile'),
        Expert: allNotions.filter(n => n.difficulty === 'Expert')
    };
}
/**
 * Trouve les prérequis manquants pour une notion
 */
export function getMissingPrerequisites(structure, notionId, progressMap) {
    const notion = findNotion(structure, notionId);
    if (!notion || !notion.prerequisites)
        return [];
    return notion.prerequisites
        .filter(prereqId => {
        const progress = progressMap.get(prereqId);
        return !progress || progress.masteryLevel < 2; // Non maîtrisé
    })
        .map(prereqId => findNotion(structure, prereqId))
        .filter(Boolean);
}
/**
 * Recherche de notions par mots-clés
 */
export function searchNotions(structure, query) {
    const lowerQuery = query.toLowerCase();
    const allNotions = getAllNotions(structure);
    return allNotions.filter(notion => {
        // Recherche dans le nom
        if (notion.name.toLowerCase().includes(lowerQuery))
            return true;
        // Recherche dans la description
        if (notion.description.toLowerCase().includes(lowerQuery))
            return true;
        // Recherche dans les tags
        if (notion.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            return true;
        // Recherche dans les mots-clés
        if (notion.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery)))
            return true;
        return false;
    });
}
/**
 * Valide qu'une structure est bien formée
 */
export function validateStructure(structure) {
    const errors = [];
    // Vérifier les champs obligatoires
    if (!structure.id)
        errors.push('Missing subject ID');
    if (!structure.name)
        errors.push('Missing subject name');
    if (!structure.version)
        errors.push('Missing version');
    if (!structure.structureType)
        errors.push('Missing structure type');
    if (!structure.chapters || structure.chapters.length === 0) {
        errors.push('No chapters defined');
    }
    // Vérifier l'unicité des IDs
    const notionIds = new Set();
    const chapterIds = new Set();
    const sectionIds = new Set();
    const subsectionIds = new Set();
    for (const chapter of structure.chapters) {
        if (chapterIds.has(chapter.id)) {
            errors.push(`Duplicate chapter ID: ${chapter.id}`);
        }
        chapterIds.add(chapter.id);
        for (const section of chapter.sections) {
            if (sectionIds.has(section.id)) {
                errors.push(`Duplicate section ID: ${section.id}`);
            }
            sectionIds.add(section.id);
            for (const subsection of section.subsections) {
                if (subsectionIds.has(subsection.id)) {
                    errors.push(`Duplicate subsection ID: ${subsection.id}`);
                }
                subsectionIds.add(subsection.id);
                for (const notion of subsection.notions) {
                    if (notionIds.has(notion.id)) {
                        errors.push(`Duplicate notion ID: ${notion.id}`);
                    }
                    notionIds.add(notion.id);
                }
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
