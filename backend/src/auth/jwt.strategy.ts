import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'edumarkaz_secret_key_777', // In real setup this goes in .env
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      username: payload.login, 
      role: payload.role, 
      centerId: payload.centerId,
      name: payload.name
    };
  }
}

// Simple Guard
import { AuthGuard } from "@nestjs/passport";
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
