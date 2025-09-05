#pet-directory/test-backend.sh
#!/bin/bash
set -e

API_URL="http://localhost:5000/api"
EMAIL="juniornunez480@gmail.com"
PASSWORD='$Lamberto75'
KEEP_MODE=false
SEED_COUNT=0
CREATED_USERS=()
CREATED_BUSINESSES=()
CREATED_SERVICES=()
CREATED_PETS=()
CREATED_REVIEWS=()

# --- Parse arguments ---
for arg in "$@"; do
  case $arg in
    --keep)
      KEEP_MODE=true
      shift
      ;;
    --seed=*)
      SEED_COUNT="${arg#*=}"
      shift
      ;;
  esac
done

# --- Helper Functions ---
log() { echo "[`date`] $1"; }

random_coords() {
  LAT=$(awk -v min=-90 -v max=90 'BEGIN{srand(); print min+rand()*(max-min)}')
  LON=$(awk -v min=-180 -v max=180 'BEGIN{srand(); print min+rand()*(max-min)}')
  echo "$LAT $LON"
}

random_choice() {
  local arr=("$@")
  echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# --- Login ---
log "Logging in..."
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r .token)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi
log "✅ Logged in successfully"

# --- API Functions ---
create_user() {
  NAME=$1
  EMAIL=$2
  PASSWORD=$3
  RESPONSE=$(curl -s -X POST $API_URL/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  ID=$(echo "$RESPONSE" | jq -r .userId 2>/dev/null || echo "null")
  CREATED_USERS+=("$ID")
  echo $ID
}

create_pet() {
  NAME=$1
  TYPE=$2
  BREED=$3
  AGE=$4
  USER_ID=$5
  RESPONSE=$(curl -s -X POST $API_URL/pets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"type\":\"$TYPE\",\"breed\":\"$BREED\",\"age\":$AGE,\"userId\":$USER_ID}")
  ID=$(echo "$RESPONSE" | jq -r .id 2>/dev/null || echo "null")
  CREATED_PETS+=("$ID")
  echo $ID
}

create_business() {
  NAME=$1
  TYPE=$2
  ADDR=$3
  CONTACT=$4
  DESC=$5
  USER_ID=$6
  COORDS=($(random_coords))
  LAT="${COORDS[0]}"
  LON="${COORDS[1]}"
  RESPONSE=$(curl -s -X POST $API_URL/businesses \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"type\":\"$TYPE\",\"address\":\"$ADDR\",\"contactInfo\":\"$CONTACT\",\"description\":\"$DESC\",\"latitude\":$LAT,\"longitude\":$LON,\"userId\":$USER_ID}")
  ID=$(echo "$RESPONSE" | jq -r .id 2>/dev/null || echo "null")
  CREATED_BUSINESSES+=("$ID")
  echo $ID
}

create_service() {
  NAME=$1
  PRICE=$2
  DURATION=$3
  BUSINESS_ID=$4
  RESPONSE=$(curl -s -X POST $API_URL/services \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"price\":$PRICE,\"duration\":$DURATION,\"businessId\":$BUSINESS_ID}")
  ID=$(echo "$RESPONSE" | jq -r .id 2>/dev/null || echo "null")
  CREATED_SERVICES+=("$ID")
  echo $ID
}

create_review() {
  RATING=$1
  COMMENT=$2
  USER_ID=$3
  BUSINESS_ID=$4
  SERVICE_ID=$5
  RESPONSE=$(curl -s -X POST $API_URL/businesses/$BUSINESS_ID/reviews \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"rating\":$RATING,\"comment\":\"$COMMENT\",\"userId\":$USER_ID,\"serviceId\":$SERVICE_ID}")
  ID=$(echo "$RESPONSE" | jq -r .id 2>/dev/null || echo "null")
  CREATED_REVIEWS+=("$ID")
  echo $ID
}

# --- Cleanup ---
cleanup_all() {
  if [ "$KEEP_MODE" = true ]; then
    log "⚠️ Keep mode enabled: Skipping deletion."
    return
  fi

  log "Cleaning up reviews..."
  for RID in "${CREATED_REVIEWS[@]}"; do
    curl -s -X DELETE $API_URL/reviews/$RID -H "Authorization: Bearer $TOKEN"
  done

  log "Cleaning up services..."
  for SID in "${CREATED_SERVICES[@]}"; do
    curl -s -X DELETE $API_URL/services/$SID -H "Authorization: Bearer $TOKEN"
  done

  log "Cleaning up businesses..."
  for BID in "${CREATED_BUSINESSES[@]}"; do
    curl -s -X DELETE $API_URL/businesses/$BID -H "Authorization: Bearer $TOKEN"
  done

  log "Cleaning up pets..."
  for PID in "${CREATED_PETS[@]}"; do
    curl -s -X DELETE $API_URL/pets/$PID -H "Authorization: Bearer $TOKEN"
  done

  log "Cleaning up users..."
  for UID in "${CREATED_USERS[@]}"; do
    curl -s -X DELETE $API_URL/users/$UID -H "Authorization: Bearer $TOKEN"
  done
}

# --- Seed Loop ---
log "Seeding $SEED_COUNT users and businesses..."
for i in $(seq 1 $SEED_COUNT); do
  USER_ID=$(create_user "Test User $i" "user$i@example.com" "Password123!")

  # Each user gets 1–3 pets
  for j in $(seq 1 $((RANDOM % 3 + 1))); do
    create_pet "Pet${i}_$j" $(random_choice "Dog" "Cat" "Exotic") "Breed$j" $((RANDOM%15+1)) "$USER_ID"
  done

  # Each user gets 1–2 businesses
  for b in $(seq 1 $((RANDOM % 2 + 1))); do
    BUSINESS_ID=$(create_business "Business${i}_$b" $(random_choice "Vet" "Groomer" "Pet Sitter" "Dog Park") "Street $i-$b" "123-456-78${i}${b}" "Awesome service $i-$b" "$USER_ID")
    
    # Each business has 2–5 services
    for s in $(seq 1 $((RANDOM % 4 + 2))); do
      SERVICE_ID=$(create_service "Service${i}_${b}_$s" $((RANDOM%200+20)) $((RANDOM%120+30)) "$BUSINESS_ID")
    done

    # Each business has 1–3 reviews from random users
    for r in $(seq 1 $((RANDOM % 3 + 1))); do
      REVIEW_USER_ID=$(random_choice "${CREATED_USERS[@]}")
      SERVICE_ID=$(random_choice "${CREATED_SERVICES[@]}")
      create_review $((RANDOM%5+1)) "Review $r for Business${i}_$b" "$REVIEW_USER_ID" "$BUSINESS_ID" "$SERVICE_ID"
    done
  done
done

# --- Cleanup ---
cleanup_all

# --- Summary ---
echo "📊 Seed Summary"
echo "Users: ${CREATED_USERS[@]}"
echo "Businesses: ${CREATED_BUSINESSES[@]}"
echo "Services: ${CREATED_SERVICES[@]}"
echo "Pets: ${CREATED_PETS[@]}"
echo "Reviews: ${CREATED_REVIEWS[@]}"
