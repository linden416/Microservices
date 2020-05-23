import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config';

const router: Router = Router();

// Generate a salted hash from given password
async function generatePassword(plainTextPassword: string): Promise<string> {
    //@TODO Use Bcrypt to Generated Salted Hashed Passwords
    console.log(`@generatePassword`);
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}

// Regen password from hash and compare to given password
async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
    console.log(`@comparePasswords`);
    const compare = await bcrypt.compare(plainTextPassword, hash);
    return compare;
}

// Generate token
function generateJWT(user: User): string {
    //@TODO Use jwt to create a new JWT Payload containing
    console.log(`@generateJWT`);
    let ue = JSON.stringify(user); 
    console.log(`@User: ${ue}`);
    let jwtoken = jwt.sign(ue, config.jwt.secret);
    console.log(`@JWT: ${jwtoken}`);
    return jwtoken;
}

// Check for valid token
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log(`@requireAuth`);
    console.log(`@Headers.Authorization: ${req.headers.authorization}`);

    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      return next();
    });
}

router.get('/verification', 
    requireAuth, 
    async (req: Request, res: Response) => {
        return res.status(200).send({ auth: true, message: 'Authenticated.' });
});

// Login User
router.post('/login', async (req: Request, res: Response) => {
    console.log(`@/users/auth/login`);
    const email = req.body.email;
    const password = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);
    // check that user exists
    if(!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // check that the password matches
    const authValid = await comparePasswords(password, user.password_hash)

    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // Generate JWT
    const jwt = generateJWT(user);
    console.log(`@JWToken: ${jwt}`);
 
    res.status(200).send({ auth: true, token: jwt, user: user.short()});
});

// Register a new user
router.post('/', async (req: Request, res: Response) => {
    console.log(`@/users/auth/  Register`);
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await User.findByPk(email);
    // check that user doesnt exists
    if(user) {
        let ue = JSON.stringify(user);
        console.log(`@User: ${ue}`);
        return res.status(422).send({ auth: false, message: 'User already exists' });
    }
    else{
        console.log(`@User Not Found, Registering New User`);
    }

    const password_hash = await generatePassword(plainTextPassword);

    const newUser = await new User({
        email: email,
        password_hash: password_hash
    });

    let savedUser;
    try {
        savedUser = await newUser.save();
        let ue = JSON.stringify(savedUser);
        console.log(`@New User: ${ue}`);
    } catch (e) {
        throw e;
    }

    // Generate JWT
    const jwt = generateJWT(savedUser);

    res.status(201).send({token: jwt, user: savedUser.short()});
});

router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;