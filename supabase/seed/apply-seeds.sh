#!/bin/bash
# Apply N'Ko Seed Data to Supabase

set -e

PROJECT_ID="zceeunlfhcherokveyek"
ACCESS_TOKEN="sbp_c0396ffbcc98f16e1bfb59729b71584f3d712cbe"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

run_sql_file() {
    local file="$1"
    local desc="$2"
    
    echo "📤 Applying: $desc"
    
    # Read SQL from file and escape for JSON
    local sql=$(cat "$file")
    
    # Use jq to properly escape the SQL for JSON
    local json_payload=$(jq -n --arg sql "$sql" '{"query": $sql}')
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
        echo "   ✅ Success"
        # Show row count if available
        if echo "$body" | jq -e '.[0].count' >/dev/null 2>&1; then
            echo "   📊 Rows affected: $(echo "$body" | jq '.[0].count')"
        fi
    else
        echo "   ⚠️  HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    
    # Small delay to avoid rate limiting
    sleep 0.3
}

echo "🌱 Starting N'Ko Seed Data Application"
echo "======================================="
echo ""

# Check jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required. Install with: brew install jq"
    exit 1
fi

# Apply seed files in order
if [[ -f "$SCRIPT_DIR/001_alphabet.sql" ]]; then
    run_sql_file "$SCRIPT_DIR/001_alphabet.sql" "001: N'Ko Alphabet (52 characters)"
fi

if [[ -f "$SCRIPT_DIR/002_vocabulary.sql" ]]; then
    run_sql_file "$SCRIPT_DIR/002_vocabulary.sql" "002: Core Vocabulary (100+ words)"
fi

if [[ -f "$SCRIPT_DIR/003_greetings.sql" ]]; then
    run_sql_file "$SCRIPT_DIR/003_greetings.sql" "003: Greetings and Phrases"
fi

echo ""
echo "======================================="

# Verify results
echo ""
echo "📊 Verification Query..."

VERIFY_SQL="SELECT 
    'nko_vocabulary' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN pos = 'letter' THEN 1 END) as letters,
    COUNT(CASE WHEN pos = 'phrase' THEN 1 END) as phrases,
    COUNT(CASE WHEN category = 'greetings' THEN 1 END) as greetings
FROM nko_vocabulary;"

json_payload=$(jq -n --arg sql "$VERIFY_SQL" '{"query": $sql}')

response=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$json_payload")

echo ""
echo "📈 Database Summary:"
echo "$response" | jq -r '.[] | "   Total: \(.total_rows) | Letters: \(.letters) | Phrases: \(.phrases) | Greetings: \(.greetings)"'

echo ""
echo "✅ Seed data application complete!"

