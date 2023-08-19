import React , {useState , useEffect}  from 'react';

export const NoteCard1 = ( { note }) => {
    const [remainingTime , setRemainingTime] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
   

    useEffect(() =>{
        const expireDate = new Date(note.expirationDate);
        const currentTime = new Date()
        const expiresIn = expireDate.getTime() - currentTime.getTime();
        setRemainingTime(expiresIn);
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
          const newRemainingTime = Math.max(0, remainingTime - 1000);
          setRemainingTime(newRemainingTime);

          const newHours = Math.floor(newRemainingTime / (1000 * 60 * 60)) % 24;
          const newMinutes = Math.floor(newRemainingTime / (1000 * 60)) % 60;
          const newSeconds = Math.floor(newRemainingTime / 1000) % 60;

          setHours(newHours);
          setMinutes(newMinutes);
          setSeconds(newSeconds);
    
          if (remainingTime <= 0) {
            clearInterval(interval);
          }
        }, 1000); // Update remainingTime every second
    
        return () => {
          clearInterval(interval);
        };
    }, [remainingTime]);

    if(hours > 0 || minutes >0 || seconds>0 ){
        return(
            <div className='noteCard'>
                <p id='account-name'>{note.noteID.name}</p>
                <label>Password :</label>
                <p><span id='timer-labels'>Expires In : H : M : S  : :  </span>
                <span id = 'timer-display'>{hours} : {minutes} : {seconds}</span></p>
                <p>{note.noteID.password}</p>
            </div>
        )
    }
}