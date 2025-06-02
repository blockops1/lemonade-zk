// Constants for game mechanics
global COST_PER_GLASS: Field = 2; // $0.02 represented as 2 cents
global COST_PER_SIGN: Field = 15;  // $0.15 represented as 15 cents
global STARTING_ASSETS: Field = 200; // $2.00 represented as 200 cents

// Weather multipliers (as percentages)
global WEATHER_HOT_AND_DRY: Field = 150; // 1.5x
global WEATHER_SUNNY: Field = 100; // 1.0x
global WEATHER_CLOUDY: Field = 40; // 0.4x

struct GameState {
    current_assets: Field,    // Current money in cents
    total_profit: Field,      // Total profit in cents
    day_count: Field,         // Number of days played
    best_day_profit: Field,   // Best single day profit in cents
    total_glasses_sold: Field, // Total glasses sold
    bankruptcy_count: Field    // Number of times gone bankrupt
}

// Fixed-point log2 approximation for price scaling
// Input and output are multiplied by 100 for 2 decimal precision
fn log2_fixed(x: Field) -> Field {
    // Lookup table for log2 values from $0.01 to $5.00
    // Values are multiplied by 100 for 2 decimal precision
    let x_int = x as u64;
    
    // Very low prices ($0.01 - $0.10)
    if x_int <= 1 { -664 as Field }        // log2(0.01) ~= -6.64
    else if x_int <= 2 { -564 as Field }   // log2(0.02) ~= -5.64
    else if x_int <= 5 { -432 as Field }   // log2(0.05) ~= -4.32
    else if x_int <= 10 { -332 as Field }  // log2(0.10) ~= -3.32
    
    // Low prices ($0.11 - $0.50)
    else if x_int <= 15 { -274 as Field }  // log2(0.15) ~= -2.74
    else if x_int <= 20 { -232 as Field }  // log2(0.20) ~= -2.32
    else if x_int <= 25 { -200 as Field }  // log2(0.25) ~= -2.00
    else if x_int <= 30 { -174 as Field }  // log2(0.30) ~= -1.74
    else if x_int <= 40 { -132 as Field }  // log2(0.40) ~= -1.32
    else if x_int <= 50 { -100 as Field }  // log2(0.50) ~= -1.00
    
    // Medium prices ($0.51 - $2.00)
    else if x_int <= 75 { -42 as Field }   // log2(0.75) ~= -0.42
    else if x_int <= 100 { 0 as Field }    // log2(1.00) = 0
    else if x_int <= 125 { 32 as Field }   // log2(1.25) ~= 0.32
    else if x_int <= 150 { 58 as Field }   // log2(1.50) ~= 0.58
    else if x_int <= 175 { 81 as Field }   // log2(1.75) ~= 0.81
    else if x_int <= 200 { 100 as Field }  // log2(2.00) = 1.00
    
    // High prices ($2.01 - $5.00)
    else if x_int <= 250 { 132 as Field }  // log2(2.50) ~= 1.32
    else if x_int <= 300 { 158 as Field }  // log2(3.00) ~= 1.58
    else if x_int <= 350 { 181 as Field }  // log2(3.50) ~= 1.81
    else if x_int <= 400 { 200 as Field }  // log2(4.00) = 2.00
    else if x_int <= 450 { 217 as Field }  // log2(4.50) ~= 2.17
    else if x_int <= 500 { 232 as Field }  // log2(5.00) ~= 2.32
    
    // Prices above $5.00
    else { (232 as Field) + ((x_int as Field - 500 as Field) / 100 as Field) } // Approximate for higher prices
}

fn main(
    previous_state: GameState,  // Previous day's verified state
    final_state: GameState,     // Today's final state
    day_number: Field,          // Current day number
    glasses_made: Field,        // Number of glasses made
    signs_made: Field,          // Number of signs made
    price: Field,              // Price per glass in cents
    weather: Field,            // Weather condition (0=cloudy, 1=sunny, 2=hot)
    glasses_sold: Field,       // Number of glasses sold
    random_factor: Field       // Random demand factor (60-140%)
) {
    // Verify day number is valid
    assert(day_number as u64 > 0);
    assert(day_number as u64 <= 30);
    
    // Verify weather is valid (0-2)
    let weather_valid = (weather as u64 >= 0) & (weather as u64 <= 2);
    assert(weather_valid);
    
    // Verify random factor is valid (60-140%)
    let random_valid = (random_factor as u64 >= 60) & (random_factor as u64 <= 140);
    assert(random_valid);
    
    // Calculate costs
    let lemonade_cost = glasses_made * COST_PER_GLASS;
    let sign_cost = signs_made * COST_PER_SIGN;
    let total_cost = lemonade_cost + sign_cost;
    
    // Verify player had enough money
    let assets_sufficient = previous_state.current_assets as u64 >= total_cost as u64;
    assert(assets_sufficient);
    
    // Calculate expected demand based on price
    let weather_multiplier = if weather as u64 == 0 { 
        WEATHER_CLOUDY 
    } else if weather as u64 == 1 { 
        WEATHER_SUNNY 
    } else { 
        WEATHER_HOT_AND_DRY 
    };
    
    let base_demand = if price as u64 < 25 {
        // For prices under $0.25, use linear demand
        let demand_valid = (30 * 100) as u64 >= (120 * price) as u64; // Ensure no negative results
        assert(demand_valid);
        30 - ((price * 120) / 100)
    } else {
        // For higher prices, use logarithmic falloff
        let price_factor = price / 25; // Normalize to $0.25 units
        30 / (1 + log2_fixed(price_factor))
    };
    
    // Calculate sign effect
    let sign_effect = if signs_made as u64 > 0 {
        // Progressive bonus based on number of signs
        let sign_bonus = if signs_made as u64 <= 2 { 15 }
        else if signs_made as u64 <= 4 { 25 }
        else if signs_made as u64 <= 8 { 35 }
        else { 40 };
        
        base_demand * sign_bonus / 100
    } else {
        0
    };
    
    // Calculate total expected demand
    let expected_demand = ((base_demand + sign_effect) * weather_multiplier * random_factor) / 10000;
    
    // Verify sales constraints
    let sales_valid = glasses_sold as u64 <= glasses_made as u64;
    assert(sales_valid);
    
    // Verify demand constraints
    let demand_valid = glasses_sold as u64 <= expected_demand as u64;
    assert(demand_valid);
    
    // Calculate revenue and profit
    let revenue = glasses_sold * price;
    let profit = revenue - total_cost;
    
    // Verify final state matches calculations
    assert(final_state.current_assets == previous_state.current_assets + profit);
    assert(final_state.total_profit == previous_state.total_profit + profit);
    assert(final_state.day_count == previous_state.day_count + 1);
    assert(final_state.best_day_profit == if profit as u64 > previous_state.best_day_profit as u64 { 
        profit 
    } else { 
        previous_state.best_day_profit 
    });
    assert(final_state.total_glasses_sold == previous_state.total_glasses_sold + glasses_sold);
    
    // Handle bankruptcy
    if final_state.current_assets as u64 <= 0 {
        assert(final_state.bankruptcy_count == previous_state.bankruptcy_count + 1);
        assert(final_state.current_assets == STARTING_ASSETS); // Reset to starting amount
    } else {
        assert(final_state.bankruptcy_count == previous_state.bankruptcy_count);
    }
}

#[test]
fn test_daily_game() {
    // Test initial state
    let initial_state = GameState {
        current_assets: 200,    // Starting with $2.00
        total_profit: 0,
        day_count: 0,
        best_day_profit: 0,
        total_glasses_sold: 0,
        bankruptcy_count: 0
    };
    
    // Expected final state after one day
    // Made 10 glasses ($0.20) and 2 signs ($0.30) = $0.50 total cost
    // Sold 8 glasses at $0.25 each = $2.00 revenue
    // Profit = $2.00 - $0.50 = $1.50
    // Final assets = $2.00 + $1.50 = $3.50
    let final_state = GameState {
        current_assets: 350,    // $3.50 (initial $2.00 + $1.50 profit)
        total_profit: 150,      // $1.50 profit
        day_count: 1,
        best_day_profit: 150,   // $1.50 best day
        total_glasses_sold: 8,
        bankruptcy_count: 0
    };
    
    main(
        initial_state,
        final_state,
        1,              // day number
        10,             // glasses made
        2,              // signs made
        25,             // price (25 cents)
        1,              // weather (SUNNY)
        8,              // glasses sold
        100             // random factor (1.0)
    );
}
