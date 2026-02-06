import React, { useState } from "react";
import "./ConferenceEvent.css";
import TotalCost from "./TotalCost";
import { useSelector, useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "./venueSlice";
import { incrementAvQuantity, decrementAvQuantity } from "./avSlice";
import { toggleMealSelection } from "./mealsSlice";

const ConferenceEvent = () => {
  const [showItems, setShowItems] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const venueItems = useSelector((state) => state.venue); //This gets a list of vense from the venue Slicer
  // Note that we don't need to index further as the entire state is the list of venues.
  // I'm used to seeing property names inside states -> such as state.venue.venueItems but not here because the state itself is the list of venues.
  const avItems = useSelector((state) => state.av);
  const mealItems = useSelector((state) => state.meals);

  const dispatch = useDispatch();
  const remainingAuditoriumQuantity = 3 - venueItems.find(item => item.name === "Auditorium Hall (Capacity:200)").quantity;

  
  const handleToggleItems = () => {
      console.log("handleToggleItems called");
      setShowItems(!showItems);
  };

  const handleAddToCart = (index) => {
      if (venueItems[index].name === "Auditorium Hall (Capacity:200)" && venueItems[index].quantity >= 3) {
        return; 
      }
      dispatch(incrementQuantity(index));
    };
  
  const handleRemoveFromCart = (index) => {
    if (venueItems[index].quantity > 0) {
      dispatch(decrementQuantity(index));
    }
  };
    
  const handleIncrementAvQuantity = (index) => {
    if (avItems[index]){
      dispatch(incrementAvQuantity(index));
    }
  };

  const handleDecrementAvQuantity = (index) => {
    if (avItems[index] && avItems[index].quantity > 0 ){
      dispatch(decrementAvQuantity(index));
    };
  };

  const handleMealSelection = (index) => {
    // I don't get this first part at all. Where is the mealForPeople coming from?
    // const item = mealItems[index];
    // if (item.selected && item.type === "mealForPeople") {
    //   // Ensure that the number of people is set before toggling the selection
    //   const newNumberOfPeople = item.selected ? numberOfPeople : 0;
    //   dispatch(toggleMealSelection(index ,newNumberOfPeople));
    // }
    // else { // If not selected, select it
    //   dispatch(toggleMealSelection(index));
    // }

    if (mealItems[index] && numberOfPeople > 0) {
      dispatch(toggleMealSelection(index));
    }
  };


  const getItemsFromTotalCost = () => {
    // I really don't get the official code for this part so I rewrote it to what I thought made sense.
      const items = [];
      venueItems.forEach((item) => {
        if (item.quantity > 0) {
          items.push({ ...item, type: "venue" });
        }
      });
      avItems.forEach((item) => {
        if (item.quantity > 0) { // && !items.some((i) => i.name === item.name && i.type === "av"))
          items.push({ ...item, type: "av" });
        }
      });
      mealItems.forEach((item) => {
        if (item.selected && numberOfPeople > 0) {
          items.push({ ...item, type: "meals", quantity: numberOfPeople });
        }
      });
      return items;
  };

  const items = getItemsFromTotalCost();

  const ItemsDisplay = ({ items }) => {
    console.log(items);
    return(<div className="display_box1">
      {items.length === 0 && <p>No items selected.</p>}
      <table className="table_item_data">
        <thead>
          <tr>
            <th>Name</th>
            <th>Unit Cost</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>${item.cost}</td>
              <td>{item.type==="meals" ? `for ${numberOfPeople} people` : item.quantity}</td>
              <td>{item.type==="meals" ? item.cost * numberOfPeople : item.cost * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>);
  };

  const calculateTotalCost = (section) => {
      let totalCost = 0;
      if (section === "venue") {
        venueItems.forEach((item) => { //Foreach does not create a new array
          totalCost += item.cost * item.quantity;
        });
      } else if (section === "addons") {
        avItems.forEach((item) => {
          totalCost += item.cost * item.quantity;
        })
      } else if (section === "meals") {
        mealItems.forEach((item) => {
          if (item.selected) {
            totalCost += item.cost * numberOfPeople;
          }
        })
      }
      return totalCost;
    };
  const venueTotalCost = calculateTotalCost("venue");
  const addonTotalCost = calculateTotalCost("addons");
  const mealTotalCost = calculateTotalCost("meals");
  const totalCosts = {
    venue: venueTotalCost,
    av: addonTotalCost,
    meals: mealTotalCost,
  };

  const navigateToProducts = (idType) => {
    if (idType == '#venue' || idType == '#addons' || idType == '#meals') { //Is # a way to navigate to specific div id?
      if (showItems) { // Check if showItems is true
        setShowItems(!showItems); // Toggle showItems to false only if it's currently true (viewing cost table pop-up)
      }
    }
  };

  return (<>
  
    {/* Navigation Header */}
    {/* Used to be navbar but html 5 browser doesn't like the non-native name although it rendered fine; Had to change 2 css class naming to accommodate */}
    <nav className="navbar_event_conference">
      <div className="company_logo">Conference Expense Planner</div>
      <div className="left_navbar">
          <div className="nav_links">
              <a href="#venue" onClick={() => navigateToProducts("#venue")} >Venue</a>
              <a href="#addons" onClick={() => navigateToProducts('#addons')}>Add-ons</a>
              <a href="#meals" onClick={() => navigateToProducts('#meals')}>Meals</a>
          </div>
          {/* Clicking details button set showItems to true, which triggers conditional rendering of cost table pop-up */}
          {/* Clicking details button again set showItems to false, which triggers conditional rendering of product page */}
          <button className="details_button" onClick={() => setShowItems(!showItems)}>
              Show Details
          </button>
      </div>
    </nav>
    
    {/* Main */}
    <div className="main_container">
      {!showItems ? (
        <div className="items-information">
          <div id="venue" className="venue_container container_main">
            <div className="text">
              <h1>Venue Room Selection</h1>
            </div>
            <div className="venue_selection">
              {venueItems.map((item, index) => (
                <div className="venue_main" key={index}>
                  <div className="img">
                    <img src={item.img} alt={item.name} />
                  </div>
                  <div className="text">{item.name}</div>
                  <div>${item.cost}</div>
                  <div className="button_container">
                    <button
                      className={item.quantity === 0 ? "btn-warning btn-disabled" : "btn-minus btn-warning"}
                      onClick={() => handleRemoveFromCart(index)}
                    >
                    &#8211;
                    </button>
                    <span className="selected_count">
                    {item.quantity > 0 ? ` ${item.quantity}` : "0"}
                    </span>
                    <button
                    className={remainingAuditoriumQuantity === 0? "btn-success btn-disabled" : "btn-success btn-plus"}
                    onClick={() => handleAddToCart(index)}
                    >
                    &#43;
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="total_cost">Total Cost: ${venueTotalCost}</div>
          </div>

          {/*Necessary Add-ons*/}
          <div id="addons" className="venue_container container_main">
            <div className="text">
            <h1> Add-ons Selection</h1>
            </div>

            <div className="addons_selection">
              {avItems.map((item, index) => (
                <div key={index} className="av_data venue_main">
                  <div className="img">
                    <img src={item.img} alt={item.name}/>
                  </div>
                  <div className="text">{item.name}</div>
                  <div>(Cost: ${item.cost})</div>
                  <div className="button_container">
                    <button className={item.quantity === 0 ? "btn-warning btn-disabled" : "btn-warning btn-minus"} //items.quantity === 0 is a strict equality check
                    onClick={() => handleDecrementAvQuantity(index)}> &#8211; </button>
                    <span className="selected_count"> {item.quantity > 0 ? ` ${item.quantity} ` : "0"} </span>
                    {/* span makes sure that the text stays on the same line */}
                    <button className="btn-success btn-plus" onClick={() => handleIncrementAvQuantity(index)}> &#43; </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total_cost">Total Cost: ${addonTotalCost}</div>

          </div>

          {/* Meal Section */}
          <div id="meals" className="venue_container container_main">
            <div className="text">
                <h1>Meals Selection</h1>
            </div>
            <div className="input-container venue_selection">
              <label htmlFor="numberOfPeople"><h3>Number of People:</h3></label>
              <input type="number" min="1" className="input_box5" 
              id="numberOfPeople" value={numberOfPeople} 
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
              />
            </div>

            <div className="meal_selection">
              {mealItems.map((item, index) => (
                <div key={index} className="meal_item" style={{padding: 15}}>
                  <div className="inner">
                    <input type="checkbox" id={`meal_${index}`} checked={item.selected} onChange={() => handleMealSelection(index)} />
                    <label htmlFor={`meal_${index}`}> {item.name} </label>
                  </div>
                  <div className="meal_cost">${item.cost}</div>
                  {/* <div className="text">{item.name}</div>
                  <div>(Cost: ${item.cost})</div>
                  <div className = "button_container">
                    <button className = {item.selected ? "btn-success btn-plus" : "btn-warning btn-minus"} onClick={()=> handleMealSelection(index)}>
                      {item.selected ? "Selected" : "Select"}
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
            <div className="total_cost">Total Cost: ${mealTotalCost}</div>
          </div>
        </div>
      ) : (
        <div className="total_amount_detail">
          {/* Here we passed a UI Component as prop <ItemsDisplay/> */}
          <TotalCost totalCosts={totalCosts} handleClick={handleToggleItems} ItemsDisplay={() => <ItemsDisplay items={items} />} />
        </div>
      )}
    </div>
  </>);
  
};

export default ConferenceEvent;
