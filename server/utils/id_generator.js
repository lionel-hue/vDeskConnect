const generator = () =>{
    let id =  Math.round( Math.random()*9999999 )
    let pos = Math.round( Math.random()*7 )

    id = id.toString().split("")

    id = id.map((elem, index) => {
        switch (pos) {
            case 1:
                return index === 0 ? 'A' : elem
            case 2:
                return index === 1 ? 'B' : elem
            case 3:
                return index === 2 ? 'C' : elem
            case 4:
                return index === 3 ? 'D' : elem
            case 5:
                 return index === 4 ? 'E' : elem
            case 6:
                return index === 5 ? 'F' : elem
            case 7:
                return index === 6 ? 'G' : elem
            default:
                return elem
        }
    })
    return id.join("")
}

export default generator