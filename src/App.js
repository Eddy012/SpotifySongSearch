import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { Button, Container, FormControl, InputGroup, Card } from 'react-bootstrap';

const CLIENT_ID = "7390c0c97edc4310a2bcf1caf0140769"
const CLIENT_SECRET = "1e65941a317b4d719fe0cb456184ed5b"

function App() {
  const [inputVal, getInputVal] = useState("");
  const [accessToken, getAccessToken] = useState("");
  const [songInfo, getSongInfo] = useState([]);
  const [randNum, getRandNum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tokenFetched, setTokenFetched] = useState(false);

  useEffect(() => {
    console.log('getting AUTHENTICATED')

    var authparams = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authparams)
      .then(result => result.json())
      .then(data => {
        getAccessToken(data.access_token);
        setTokenFetched(true)
      })

      console.log(accessToken)
  }, [])

  async function search() {
    setLoading(true)
    console.log('searching ' + inputVal, 'using token ' + accessToken)
    var randomNum = getRandomNum()
    getRandNum(randomNum)
    console.log('my random num is' + randNum)

    //get artist ID
    var artistParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + inputVal + '&type=artist', artistParams)
      .then(response => response.json())
      .catch((err => console.log('error')))
      .then(data => { return data.artists.items[0].id })
      .catch((err => console.log('error')))

      
      console.log('Artist ID ' + artistID)
    

    // get songs 
    var returnedSongs = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/top-tracks', artistParams)
      .then(response => response.json())
      .catch((err => console.log('error')))

      .then(data => {
        // console.log(data.tracks[randomNumber].name);
        getSongInfo(data.tracks);
        
      })
      .catch((err => console.log('error')))
      console.log(songInfo)


    
  }

  useEffect(() => {
    if (tokenFetched) { // Execute only after token is fetched
      console.log('CHECKING PARAMS')
      setLoading(false)
      if (songInfo.length > 0 && songInfo[randNum] && songInfo[randNum].external_urls) {
        console.log('have all info');
        return; // Exit the useEffect once all conditions are met
      }

      // If conditions are not met, retry after a delay
      const timeout = setTimeout(() => {
        search();
      }, 1000); // Retry after 1 second

      return () => clearTimeout(timeout); // Cleanup function to clear the timeout on component unmount
    }
  }, [loading, songInfo, randNum]);

  function getRandomNum() {
    var newnum = Math.floor(Math.random() * 9) + 1
    while (newnum === randNum) {
      newnum = Math.floor(Math.random() * 9) + 1
    }
    return newnum

  }

  // console.log(songInfo)
  // const randomNumber = Math.floor(Math.random() * 10) + 1
  return (
    <div className="App">
      <Container>
        <InputGroup className="mb-3" size='lg'>
          <FormControl
            placeholder="Search for an artist!"
            type="input"

            onChange={event => getInputVal(event.target.value)}

          />

          <Button onClick = {search}>
            Enter
          </Button>
        </InputGroup>
      </Container>
      
      <Container>
      {loading && <p>Loading...</p>}

       
      {!loading && songInfo.length > 0 && songInfo[randNum] && songInfo[randNum].external_urls &&(
          <Card>
            <Card.Body>
            <a href={songInfo[randNum].external_urls.spotify} target="_blank" rel="noopener noreferrer">
              <Card.Img src={songInfo[randNum].album.images[0].url} />
            </a>
              <Card.Title>{songInfo[randNum].name}</Card.Title>
              <Card.Text>
                {/* Add other details as needed */}
              </Card.Text>
            </Card.Body>
          </Card>
        )}
        
      </Container>

      
      
    </div>
  );
}

export default App;
