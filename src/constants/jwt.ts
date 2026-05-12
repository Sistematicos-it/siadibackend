export const jwtConstants = {
    //expiration_time: 480 // 8m en segundos
    expiration_time: Number(process.env.EXPIRATION_TIME) || 480, 
}