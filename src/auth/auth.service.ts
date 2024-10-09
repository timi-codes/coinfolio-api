import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/server-auth';
import { JwtService } from '@nestjs/jwt';
import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly privy: PrivyClient;
  private readonly isPrivyVerificationEnabled: boolean;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.isPrivyVerificationEnabled = this.configService.get<boolean>(
      'PRIVY_VERIFICATION_ENABLED',
    );
    const appId = this.configService.get<string>('PRIVY_APP_ID');

    if (this.isPrivyVerificationEnabled) {
      const appSecret = this.configService.get<string>('PRIVY_APP_SECRET');
      this.privy = new PrivyClient(appId, appSecret);
    }
  }

  async findOne(id: string) {
    return this.authRepository.findOne(id);
  }

  async exchangeAuthToken(token: string) {
    let sid: string;

    if (this.isPrivyVerificationEnabled) {
      const { userId: privyUserId } = await this.privy.verifyAuthToken(token);
      sid = privyUserId;
    } else {
      sid = await this.verifyTestAuthToken(token);
    }

    const user = await this.authRepository.findOrCreate({
      privy_id: sid,
    });

    const authToken = this.jwtService.sign(user);
    return { authToken, user };
  }

  async generateTestAuthToken() {
    const key = this.configService.get<string>('JWT_SECRET');
    const privateKey = new TextEncoder().encode(key);

    const session = uuidv4();
    const subject = uuidv4();
    const issuer = this.configService.get<string>('PRIVY_APP_ID');
    const audience = this.configService.get<string>('JWT_AUDIENCE');
    const expiration = '1h';

    const token = await new jose.SignJWT({ sid: session })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(subject)
      .setExpirationTime(expiration)
      .sign(privateKey);

    return token;
  }

  async verifyTestAuthToken(token: string) {
    const key = this.configService.get<string>('JWT_SECRET');
    const issuer = this.configService.get<string>('PRIVY_APP_ID');
    const audience = this.configService.get<string>('JWT_AUDIENCE');

    const privateKey = new TextEncoder().encode(key);

    const { payload } = await jose.jwtVerify<{ sid: string }>(
      token,
      privateKey,
      {
        issuer: issuer,
        audience: audience,
      },
    );
    return payload.sid;
  }
}
