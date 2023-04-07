import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      //generate the password hash
      const hashedPassword = await argon.hash(dto.password);

      //save the user to the database
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword,
        },
      });
      delete user.hashedPassword;
      //return the user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already in use');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find the user in the database by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if user is not found throw an error
    if (!user) {
      throw new ForbiddenException('Account with this email does not exist');
    }

    //compare the password with the hash
    const passwordMatches = await argon.verify(
      user.hashedPassword,
      dto.password,
    );

    //if password is incorrect throw an error
    if (!passwordMatches) {
      throw new ForbiddenException('Incorrect password');
    }
    return this.createToken(user.id, user.email);
  }

  //create a token
  async createToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { userId, email };
    const secret = `${this.config.get('JWT_SECRET')}`;
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
