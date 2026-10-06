import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { CountryService } from "../services/country.service.js";

@Injectable()
export class CountryExists implements CanActivate {
  constructor(private readonly service: CountryService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const name = req.body?.countryName || req.params?.countryName;
    if (!name) throw new NotFoundException("Country name is required in body or params");
    await this.service.findOneByName(name);
    return true;
  }
}
