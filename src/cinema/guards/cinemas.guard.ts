import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { CityService } from "../../location/services/city.service.js";


/**class as a guard, verifies if a cityId is in the query or if the city with that Id doesn't exist
 * @return {boolean}  true OR false
 * - if it's true it let the query pass to the controller
 * - if it's false the query never gets to the controller
*/
@Injectable()
export class CityExists implements CanActivate{

    constructor(private readonly cityService: CityService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const request = context.switchToHttp().getRequest()

        const cityName = request.body?.cityName || request.params?.cityName;


         if(!cityName){
            throw new NotFoundException("The Id's city is required")
        }
       

        const cleanCityName = cityName.trim().replace(/\s+/g, ' ');
      
        const cityExists = await this.cityService.findOneByName(cleanCityName)

        if(!cityExists){
            throw new NotFoundException("The City doesn't exist")
        }

        return true;
    }
}

