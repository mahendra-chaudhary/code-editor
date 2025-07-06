import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';

// Required CSS and JS
import ACTIONS from '../Actions';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closetag.js';
import 'codemirror/addon/edit/closebrackets.js';

const Editor = ({socketRef,roomId}) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init(){
       editorRef.current =  Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
    });
   
    
     editorRef.current.on('change', (instance, changes,onCodeChange) => {
        // Here you can handle the change event, e.g., send the updated code to the server
        // console.log('changes', changes);
        const {origin} = changes;
        const code  = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE,{
            roomId,
            code,
          });

        
        }
        // console.log(code);

    });
   

  }
    init();
  }, []);

  useEffect(() => {
    if(socketRef.current){
        
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        // console.log('code change', code);
         if (code !== null) {
           editorRef.current.setValue(code);
         }
     });
    }
    return () => {
      
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      
    }
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea> ;

};

export default Editor;
