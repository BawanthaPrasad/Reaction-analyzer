// Reference to Firestore database
const db = firebase.firestore();



// Function to generate a custom lesson ID
function generateLessonID() {
  // Generate a random ID
  const lessonID = Math.random().toString(36).substr(2, 9); // Example: "5h78dsf9"
  return lessonID;
}

// Function to check if the generated lesson ID already exists in Firestore
async function isLessonIDUnique(lessonID) {
  const querySnapshot = await db.collection("lessons").where("lesson_id", "==", lessonID).get();
  return querySnapshot.empty; // Returns true if no document with the same lesson ID exists
}

// Button click event
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', async function(event) {
  event.preventDefault();
  const subject = document.getElementById('subject').value;
  const lesson = document.getElementById('lesson').value;
  const grade = document.getElementById('grade').value;
  var date = new Date();
  var current_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+ date.getDate();
  var current_time = date.getHours()+":"+date.getMinutes()+":"+ date.getSeconds();
  var date_time = current_date+" "+current_time;
  console.log(date_time);
  if (subject && lesson && grade) {
    let lessonID;
    let isUnique = false;
    // Generate a unique lesson ID
    while (!isUnique) {
      lessonID = generateLessonID();
      isUnique = await isLessonIDUnique(lessonID);
      localStorage.setItem('pass_lesson', lessonID); 
      console.log(localStorage.getItem('pass_lesson')); 
    }
    
    // Add data to Firestore
    db.collection("lessons").add({
      lesson_id: lessonID,
      subject: subject,
      lesson: lesson,
      grade: grade,
      timeStamp : date_time
    })
    // Add data to Firestore
    db.collection("reactions").add({
      lesson_id: lessonID,
      excelents:0,
      oks:0,
      poors:0
    })

    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
      alert("Grade and Lesson added successfully!");
      // Clear form fields after submission
      window.location.href = "react.html";
      document.getElementById('lesson').value = '';
      document.getElementById('grade').value = '';
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
      alert("Error: Grade and Lesson could not be added!");
    });
  } else {
    alert("Please fill out all fields.");
  }
});


// Function to handle reaction click event
function react(reactionType) {
  
  playAnimation(reactionType);
  // Get the lesson ID
  var lessonId = localStorage.getItem('pass_lesson');
  console.log('Lesson ID:', lessonId);

  var alertd = document.getElementById("alertDiv");

  // Reference to the reactions collection
  const reactionsRef = db.collection("reactions");

  // Update the reaction count based on the reaction type
  reactionsRef.where("lesson_id", "==", lessonId).get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // Get the existing values
        let data = doc.data();
        let excellents = data.excelents || 0;
        let oks = data.oks || 0;
        let poors = data.poors || 0;

        // Update the count based on the reaction type
        switch (reactionType) {
          case "excellent":
            excellents++;
            break;
          case "ok":
            oks++;
            break;
          case "poor":
            poors++;
            break;
          default:
            break;
        }

        // Update the document with new counts
        return reactionsRef.doc(doc.id).update({
          excelents: excellents,
          oks: oks,
          poors: poors
        });
      });
    })
    .then(() => {
      console.log('Reaction updated successfully.');
      showPopupMessage('Reaction updated successfully.');
    })
    .catch(error => {
      console.error('Error updating reaction:', error);
    });

    

}
function playAnimation(imageId) {
  const image = document.getElementById(imageId);
  image.classList.add('img-click-animation');
  
  // Remove animation class after animation completes
  setTimeout(() => {
    image.classList.remove('img-click-animation');
  }, 300);
}

function showPopupMessage(message) {
  var popup = document.getElementById('popupMessage');
  popup.innerText = message;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}
