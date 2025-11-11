import jwt from 'jsonwebtoken';

//user authentication middleware.

const authUser = async (req,res,next) => {
    try {
        
        const {token} = req.headers;
        if(!token) {
            return res.json({success: true, message: "No token provided."});
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        req.body.userId = token_decode.id;

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
}

export default authUser;