export type S3ObjectContentData = {
    studentId: string;
    studentNum: number;
    studentName: string;
    grade: number;
    className: string;
}

const keyToIndexMap: { [key: (keyof S3ObjectContentData)[number]]: number } = {
    studentId: 0,
    studentNum: 1,
    studentName: 2,
    grade: 3,
    className: 4,
}

export const parseS3ObjectContent = (contentList: string[]): S3ObjectContentData => {
    if (contentList.length !== Object.keys(keyToIndexMap).length) throw new Error(`Content length ${contentList.length} does not match expected length of keys`);

    return {
        studentId: contentList[keyToIndexMap.studentId].trim(),
        studentNum: parseInt(contentList[keyToIndexMap.studentNum]),
        studentName: contentList[keyToIndexMap.studentName].trim(),
        grade: parseInt(contentList[keyToIndexMap.grade]),
        className: contentList[keyToIndexMap.className].trim()
    }
}