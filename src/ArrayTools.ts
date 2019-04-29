export class ArrayTools{
    static getLast<T>(a: T[]): T{
        return a[a.length - 1];
    }

    static rmLast<T>(a: T[], minCount?: number): T[]{
        minCount = minCount || 0;
        if (a.length > minCount){
            a.length && a.splice(a.length - 1, 1);
        }
        
        return a;
    }
}