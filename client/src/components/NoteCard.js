import React , { useState , useEffect } from 'react';
import axios from "axios";
import { useGetUserName } from "../hooks/useGetUserName";
import { useGetUserID } from "../hooks/useGetUserID";
import { useGetBaseURL } from "../hooks/useGetBaseURL";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const NoteCard = ( { note , setAllNotes , fetchAllNodes , setCookie , cookies , removeCookie , socket}) => {

  //const [cookie , setCookie ] = useState(['shared-note']);
  const baseUrl = useGetBaseURL();
  const userID = useGetUserID();
  const userName = useGetUserName();
  const [ isRename , setIsRename] = useState(false);
  const [ isShare , setIsShare ] = useState(false);
  const [ newPassword , setNewPassword] = useState(note.password);
  const [ receiverEmail , setReceiverEmail] = useState("");
  const [ emailError , setEmailError ]= useState(false);
  const [ emailErrorMessage , setEmailErrorMessage ] = useState("");
  
  
  const handleRename = (e) => {
    e.stopPropagation();
    setIsRename(true);
  }

  const handleShare = (e) => {
    e.stopPropagation();
    setIsShare(true);
  }

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {

      //Delete the cookie
      
      const cookieName = `shared-note-${note._id}`;
      const regexPattern = new RegExp(cookieName);
      const fKeys = Object.keys(cookies).filter(cookie => regexPattern.test(cookie));
      for(let i=0 ; i<fKeys.length ; i++){
        removeCookie(fKeys[i]);
      }
      //console.log("Cookie Name to be Deleted = ",cookieName);
      //removeCookie(cookieName);

      await axios.delete(`${baseUrl}/notes/${note._id}`);
      toast.success('Note Deleted Successfully !..', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const response = fetchAllNodes();
      setAllNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const handlePasswordChange = async (e) => {
    // Enter Key
    e.stopPropagation();
    if(e.keyCode === 13 && e.target.value ){
      setIsRename(false);
      try {
        //Rename the password in the cookie too if that cookies is present
        const cookieName = `shared-note-${note._id}-${userID}`;
        if(cookies[cookieName]){
          const cookie = cookies[cookieName];
          cookie.password = newPassword;
          setCookie(cookieName , cookie);
        }
        await axios.post(`${baseUrl}/notes/${note._id}`, {password : newPassword});
        toast.success('Password Changed Successfully!.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        const response = fetchAllNodes();
        setAllNotes(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  }
 
  /*
  useEffect(() => {
    if(receiverToken){
      note['token'] = receiverToken;
      note['sharedBy'] = userName;
      note['receiverID'] = receiverUserID;
      //Expires in - 20 Minutes
      //const timestamp = new Date().getTime();
      const variable = `shared-note-${note._id}-${receiverUserID}`;
      note['cookieName'] = variable;

      // Set expiration to 2 hours - 2 * 60 * 60 * 1000
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + 20 * 60 * 1000); //20 minutes

      note['expires'] = expirationDate;
      const sharedNote = JSON.stringify(note);
      
      setCookie(variable , sharedNote , { expires: expirationDate } );
      
      socket.emit("sendNotification" , {
        senderName : userName,
        receiverID : receiverUserID,
        message : `${note.name}'s - password has been shared to you By`,
      });
      
      
      socket.emit("cookieData", note );
      socket.on("createCookie" , (data) => {
        console.log("Create Cookie Client = " , data);
        const receiverID = data['receiverID'];
        const expirationDate = data['expires'];
        const cookieData = JSON.stringify(data);
        const cookieValue = `${receiverID}=${cookieData}; expires=${expirationDate}`;
        document.cookie = cookieValue;
      });
    

      toast.success('😁Note Shared Successfully !..', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      //console.log("Cookie created = ", cookies[variable]);
    }
  },[receiverToken]);

  */
  
  const isValidEmail = email => {
    // Basic email validation using regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExistsOnServer = async (email) => {
    // Replace this with your actual API call or database query
    try {
      const response = await axios.post(`${baseUrl}/auth/emailcheck`, {
        email
      });
      const data = await response.data;
      return data;
    }catch (error) {
      console.error('Error checking email on the server:', error);
      return false;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.stopPropagation();
    // Enter Key
    if(e.keyCode === 13){
      if(!receiverEmail.trim()){
        setEmailErrorMessage("Email Required");
        setEmailError(true);
      }
      else if(!isValidEmail(receiverEmail)){
        setEmailErrorMessage("Invalid Email Address");
        setEmailError(true);
      }else{
        // Now check this email exists or Not
        const data = await checkEmailExistsOnServer(receiverEmail);
        if(data){
          //If Email exists now share the data to the user
          setIsShare(false);
          try{
            const response = await axios.post(`${baseUrl}/notes/shared/${note._id}`, { receiverID : data.userID});
            const r = await response.data;
            if(r.status){
              socket.emit("sendNotification" , {
                senderName : userName,
                receiverID : data.userID,
                message : `${note.name}'s - password has been shared to you By`,
              });

              toast.success('😁Note Shared Successfully !..', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
              setReceiverEmail("");
              setEmailErrorMessage("");
            }
          }catch (error) {
            console.error(error);
          }
        }
        else{
          setEmailErrorMessage("No user with this Email");
          setEmailError(true);
        }
      } 
    } 
  };
 
  return (
    <div className='noteCard'>
        <p id='account-name'>{note.name}</p>
        <label>Password :</label>
        {
          isRename ? 
          <div className='email-input-button'>
          <input 
            type='text' 
            value = {newPassword}
            onKeyDown= { handlePasswordChange }
            onChange={ (event) => setNewPassword(event.target.value)}
          >
          </input> 
          <button onClick={(e) => setIsRename(false)} id='email-input-close-button'>x</button>
          </div>
          : <p>{note.password}</p>
        }
        { 
          isShare &&
          <div className='email-input'>
            <label>Receiver Email :</label>
            <div className='email-input-button'>
            <input 
              type='text' 
              placeholder='Enter email of the Receiver'
              value = {receiverEmail}
              onKeyDown= { handleEmailSubmit }
              onChange={ (event) => setReceiverEmail(event.target.value)}
            >
            </input>
            <button onClick={(e) => setIsShare(false)} id='email-input-close-button'>x</button>
            </div>
            {
            emailError && <span id='error'>{emailErrorMessage}</span>
            }
          </div>
        }
        <span className='buttons'>
        <button onClick={ (e) => handleRename(e) }>Rename</button>
        <button onClick={ (e) => handleDelete(e) }>Delete</button>
        <button onClick={ (e) => handleShare(e) }>Share</button>
        </span>
        <ToastContainer />
    </div>
  )
}
