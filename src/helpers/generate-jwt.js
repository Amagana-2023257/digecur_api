import jwt from "jsonwebtoken";

export const generateJWT = (uid = " ") => {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          reject({
            success: false,
            message: "Error generating token",
            error: err,
          });
        } else {
          resolve(token);
        }
      }
    );
  });
};
