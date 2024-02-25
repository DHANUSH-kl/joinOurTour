export const dbName = "joinOurJourney";

export function asyncWrap(fun){
    return (req,res,next) => {
        fun(req,res,next).catch((err)=> next(err))
    }
}

