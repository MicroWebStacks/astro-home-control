
const config = {
    height: 400,
    top_limit_height: 100,
    bottom_limit_height:50,
    min_room_temp: 5,
    max_room_temp: 27,
    max_metal_temp: 55
}

function room_to_coord(room){

    const height = config.height
    const room_max_temp_y = config.top_limit_height
    const room_min_temp_y = height - config.bottom_limit_height
    const heat_height = room_max_temp_y - room_min_temp_y
    
    const y = (heat_height * (room-config.min_room_temp) / (config.max_room_temp-config.min_room_temp)) + room_min_temp_y
    let h = height - y
    if(h<0){
        h=0
    }
    return {y,h}
}

function metal_to_coord(metal){

    const height = config.height
    const room_max_temp_y = config.top_limit_height
    const room_min_temp_y = height - config.bottom_limit_height
    const heat_height = room_max_temp_y - room_min_temp_y
    const metal_height = room_max_temp_y
    const metal_room_max_temp_y = room_max_temp_y
    
    function room_section_1(input){
        const res_y = (heat_height * (input-config.min_room_temp) / (config.max_room_temp-config.min_room_temp)) + room_min_temp_y
        const res_h = height - res_y
        return [res_y,res_h]
    }
    function metal_section_2(input){
        const res_y = (metal_height * (input-config.max_room_temp) / (config.max_room_temp-config.max_metal_temp)) + metal_room_max_temp_y
        const res_h = height - res_y
        return [res_y,res_h]
    }

    let metal_y,metal_h
    if(metal < config.max_room_temp){
        [metal_y,metal_h] = room_section_1(metal)
    }else{
        [metal_y,metal_h] = metal_section_2(metal)
    }
    if(metal_h < 0){
        metal_h = 0
    }
    return {y:metal_y, h:metal_h}
}

function target_to_coord(target){
    const height = config.height
    const room_max_temp_y = config.top_limit_height
    const room_min_temp_y = height - config.bottom_limit_height
    const heat_height = room_max_temp_y - room_min_temp_y
    const target_height = room_min_temp_y - room_max_temp_y

    const res_y = (heat_height * (target-config.min_room_temp) / (config.max_room_temp-config.min_room_temp)) + room_min_temp_y
    let res_h = (target_height * (target-config.min_room_temp) / (config.max_room_temp-config.min_room_temp))
    if(res_h < 0){
        res_h = 0
    }
    return {y:res_y,h:res_h}
}

export{
    config,
    room_to_coord,
    metal_to_coord,
    target_to_coord
}
