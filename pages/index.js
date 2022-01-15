import { useEffect, useState } from 'react'
import * as Tone from 'tone'

// Y is the middle key
const BlackKey = ({char, pressed, hidden, handleClick}) => (
    <div onClick={handleClick} style={{
        height:'200px',
        width:'30px',
        border: '1px solid black',
        margin: '0px 10px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        padding:'0.2rem',
        backgroundColor: pressed? 'pink': 'black',
        color:'white',
        visibility: hidden? 'hidden' : 'visible'
    }}>
        {char}
    </div>
)

const WhiteKey = ({char, pressed, handleClick}) => (
    <div onClick={handleClick} style={{
        height:'300px',
        width:'50px',
        border: '1px solid black',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        padding:'0.2rem',
        backgroundColor: pressed? 'pink': 'white'
    }}>{char}</div>
)


const PianoKey = ({code, char, white, hidden, playSound}) => {
    const [pressed, setPressed] = useState(false)

    const handleClick = (e) => {
        if (!hidden){
            playSound(code)
            //console.log(e)
            setPressed(true)
            setTimeout(()=>setPressed(false),500)
        }
    }

    const handleKeyDown = ({keyCode, repeat}) => {
        if (keyCode === code && !repeat && !hidden){
            // play sound here
            playSound(keyCode)
            setPressed(true) 
        }
    }

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === code && !hidden)
            setPressed(false) 
    }

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    
    return white? <WhiteKey {...{char, pressed, handleClick}}/> : <BlackKey {...{char, pressed, hidden, handleClick}}/>
}

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const Keyboard = ({keys, blackKeyMapping, playSound}) => {
    const whiteKeys = keys.filter((_,i)=>i%2===0)
    const blackKeys = keys.filter((_,i)=>i%2!==0)

    return (
    <div style={{position:'relative'}}>
        <div style={{display:'flex'}}>
            {whiteKeys.map(([code, char])=><PianoKey {...{key: char, code, char, white: true, hidden: false, playSound}}/>)} 
        </div>
        <div style={{display: 'flex', position:'absolute', top:'0px', left:'29px'}}>
            {blackKeys.map(([code, char],i)=><PianoKey {...{key: char, code, char, white: false, hidden:blackKeyMapping[i]===0, playSound}}/>)} 
        </div>
    </div>
)}

const Index = () => {
    //const [loading, setLoading] = useState(false)
    const [tones, setTones] = useState(null)
    //const [player, setPlayer] = useState(null)
    const keys = zip(
        [81,50,87,51,69,52,82,53,84,54,89,55,85,56,73,57,79,48,80,189,219],
        'Q2W3E4R5T6Y7U8I9O0P-[' 
    )

    const offset = 0 // an offset of 0 means that your original track is in C.
    // if your track is A, then offset is 2
    const standardKeyMapping = '0111011011' // in C
    const blackKeyMapping = Array.from(standardKeyMapping.slice(offset)+standardKeyMapping.slice(0,offset)).map(d=>Number(d))

    useEffect(()=>{
        const x = keys.map((key,i)=>{
            if(i%2!==0)
                return [...key,blackKeyMapping[Math.floor(i/2)]]
            return [...key, 1]
        }).filter(key=>key[2])
        const middle = x.reduce((index,key,i)=>key[1]==='Y'? i : index,0)

        const test = x.map((key,i)=>(new Tone.Player(`kitties/cat${i-middle}.mp3`).toDestination()))
        Tone.loaded().then(() => {
            const temp = test.reduce(
                (obj,tone,i)=>{
                    return {...obj, [x[i][0]] : tone}
                },{})
            setTones(temp)
        });
    },[])

    const playSound = (keyCode) => {
        tones[keyCode].start()
    }

    if(!tones)
        return <div>Loading...</div>
    return (
        <div style={{
            position:'absolute',
            width:'100vw',
            height:'100vh',
            top:0,
            left:0,
            backgroundColor:'orange',
            display:'flex',
            flexDirection: 'column',
            alignItems:'center',
            justifyContent: 'center',
            backgroundImage: `url('images/bg.png')`,
            backgroundRepeat: 'repeat',
            overflow: 'hidden'
        }}>
            <div style={{flexGrow: 1,
                    display:'flex',
                    alignItems:'center',
                    justifyContent: 'center',
            }}>
                    <Keyboard {...{keys,blackKeyMapping, playSound}}/>
            </div>
            <div style={{backgroundColor: 'white', padding:'6px'}}>
                Made by <a href="https://www.twitter.com/kierenfunk">@kierenfunk</a>
            </div>
        </div>
    )
}

export default Index;