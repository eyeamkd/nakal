import { createMatches } from '../lib/matches';
import { supabase } from '../lib/supabase';
import mockResponse from '../../data.json';
import fs from 'fs';


jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// jest.mock('../lib/mockDataGenerator');

describe('Test createMatches', () => {
  it('should filter the match stats by time',()=> {  
  const currentTimestamp = Date.now(); 
  const filteredData = mockResponse.map( round => filterRound(round));
 console.log("Filtered Data", JSON.stringify(filteredData, null, 2));  
 fs.writeFileSync("result.json", JSON.stringify(filteredData, null, 2));
  })
}); 

const filterRound = (round : any) => {
  const currentTimestamp =1728017712587; 
  const paramArrayKeys = Object.keys(round); 
  const result:any = {};
  paramArrayKeys.forEach((key:any)=>{
    console.log("round value", round[key]);
    const filteredData = round[key].map((item:any)=>{ 
      if(item.mock_start < currentTimestamp) return item
      else { 
        console.log("Didnot get filtered data"); 
        return null;
      };
    }); 
    if(filteredData.length > 0){
     //console.log("Filtered Data", filteredData); 
     result[key] = filteredData;
    }else{ 
      console.log("Didnot get filtered ");
    }
  }) 
  return result;
}

