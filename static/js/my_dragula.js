for(let i=0; i<document.getElementsByClassName('container').length; i++){
    let columns = [];
    for(let j=0; j<document.getElementsByClassName('container')[i].getElementsByClassName('cards_column').length; j++)
    {
        columns.push(document.getElementById(`${String(i)+String(j)}`));
    }
    dragula(columns);
}