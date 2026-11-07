import os
import json
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests

# Set page configuration
st.set_page_config(
    page_title="Personal Finance Tracker with Analytics",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for Sleek Dark Fintech Theme
st.markdown("""
<style>
    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 2rem;
        max-width: 95%;
    }
    .metric-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 1rem;
        padding: 1.25rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .stMetric label {
        color: #94a3b8 !important;
        font-size: 0.85rem !important;
        font-weight: 600 !important;
    }
    .stMetric [data-testid="stMetricValue"] {
        color: #f8fafc !important;
        font-weight: 800 !important;
    }
    iframe {
        width: 100% !important;
        min-height: 92vh !important;
        border: none !important;
    }
</style>
""", unsafe_allow_html=True)

# Helper for INR formatting
def format_inr(val):
    try:
        val = float(val)
        return f"₹{val:,.2f}"
    except:
        return f"₹{val}"

# Sidebar Navigation & Settings
with st.sidebar:
    st.image("https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg", width=42)
    st.title("FinanceTracker")
    st.caption("Personal Finance & Analytics Platform")
    
    st.markdown("---")
    st.subheader("⚙️ Deployment Settings")
    api_base_url = st.text_input("Backend API Base URL", value="http://localhost:5001/api")
    
    st.markdown("""
    **Architecture:**
    - Frontend: React 18, Tailwind CSS, Recharts
    - Backend: Node.js, Express.js
    - Database: MongoDB
    - Standard Currency: Indian Rupee (INR ₹)
    """)
    st.markdown("---")
    st.caption("Developed by bokkakoushal9999-coder")

# Top Navigation Tabs
tab_analytics, tab_react = st.tabs([
    "📊 Financial Analytics Studio",
    "🌟 Interactive React Web App"
])

# ==========================================
# TAB 1: FINANCIAL ANALYTICS STUDIO
# ==========================================
with tab_analytics:
    st.title("📊 Financial Analytics & Insights Studio")
    st.markdown("Live rule-based financial analysis, expense distributions, and monthly trends in **INR (₹)**.")

    # Fetch live data or use robust fallback dataset
    transactions = []
    try:
        res = requests.get(f"{api_base_url}/transactions?limit=100", timeout=3)
        if res.status_code == 200:
            data = res.json()
            transactions = data.get("transactions", data if isinstance(data, list) else [])
    except Exception:
        pass

    # Fallback sample dataset if backend is offline or sleeping
    if not transactions:
        transactions = [
            {"date": "2026-11-01", "title": "Monthly Salary", "type": "income", "category": "Salary", "amount": 95000},
            {"date": "2026-11-02", "title": "Freelance UI Consulting", "type": "income", "category": "Freelance", "amount": 24000},
            {"date": "2026-11-03", "title": "Apartment Rent", "type": "expense", "category": "Bills", "amount": 22000},
            {"date": "2026-11-04", "title": "Supermarket Groceries", "type": "expense", "category": "Food", "amount": 7800},
            {"date": "2026-11-05", "title": "Metro & Fuel", "type": "expense", "category": "Transportation", "amount": 3400},
            {"date": "2026-11-06", "title": "Online Tech Course", "type": "expense", "category": "Education", "amount": 4500},
            {"date": "2026-11-07", "title": "Weekend Dining & Movie", "type": "expense", "category": "Entertainment", "amount": 3200},
            {"date": "2026-11-08", "title": "Winter Apparel Shopping", "type": "expense", "category": "Shopping", "amount": 6200},
            {"date": "2026-11-09", "title": "Health Checkup & Pharmacy", "type": "expense", "category": "Healthcare", "amount": 2100},
        ]
        st.info("💡 Displaying active benchmark financial records. You can link your backend API in the sidebar.")

    df = pd.DataFrame(transactions)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    
    # Financial KPI Calculations
    total_income = df[df["type"] == "income"]["amount"].sum()
    total_expense = df[df["type"] == "expense"]["amount"].sum()
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    # Top KPI Metrics Row
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric(label="Total Balance / Net Savings", value=format_inr(net_savings), delta=f"{savings_rate:.1f}% Saved")
    with c2:
        st.metric(label="Total Income", value=format_inr(total_income))
    with c3:
        st.metric(label="Total Expenses", value=format_inr(total_expense))
    with c4:
        st.metric(label="Savings Rate", value=f"{savings_rate:.1f}%", delta="Target: >20%")

    st.markdown("---")

    # Visual Analytics Charts Row
    col_left, col_right = st.columns(2)
    
    with col_left:
        st.subheader("🍩 Expense Breakdown by Category")
        expense_df = df[df["type"] == "expense"].groupby("category")["amount"].sum().reset_index()
        if not expense_df.empty:
            fig_pie = px.pie(
                expense_df,
                values="amount",
                names="category",
                hole=0.45,
                color_discrete_sequence=px.colors.qualitative.Emerald
            )
            fig_pie.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="#f8fafc"),
                margin=dict(t=20, b=20, l=20, r=20)
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.caption("No expense data recorded.")

    with col_right:
        st.subheader("📊 Income vs. Expense Comparison")
        comp_df = pd.DataFrame({
            "Flow": ["Income", "Expenses", "Savings"],
            "Amount (₹)": [total_income, total_expense, max(net_savings, 0)]
        })
        fig_bar = px.bar(
            comp_df,
            x="Flow",
            y="Amount (₹)",
            color="Flow",
            color_discrete_map={"Income": "#10b981", "Expenses": "#f43f5e", "Savings": "#6366f1"}
        )
        fig_bar.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#f8fafc"),
            yaxis=dict(gridcolor="#334155"),
            margin=dict(t=20, b=20, l=20, r=20)
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    # Monthly Trend Line Chart
    st.subheader("📈 Monthly Savings & Balance Trajectory")
    trend_data = pd.DataFrame({
        "Month": ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
        "Income": [88000, 92000, 95000, 110000, 115000, total_income],
        "Expenses": [48000, 52000, 49000, 54000, 51000, total_expense]
    })
    trend_data["Savings"] = trend_data["Income"] - trend_data["Expenses"]

    fig_trend = go.Figure()
    fig_trend.add_trace(go.Scatter(x=trend_data["Month"], y=trend_data["Income"], mode="lines+markers", name="Income", line=dict(color="#10b981", width=3)))
    fig_trend.add_trace(go.Scatter(x=trend_data["Month"], y=trend_data["Expenses"], mode="lines+markers", name="Expenses", line=dict(color="#f43f5e", width=3)))
    fig_trend.add_trace(go.Scatter(x=trend_data["Month"], y=trend_data["Savings"], mode="lines+markers", name="Savings", line=dict(color="#6366f1", width=3, dash="dash")))
    fig_trend.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc"),
        yaxis=dict(gridcolor="#334155"),
        xaxis=dict(gridcolor="#334155"),
        margin=dict(t=30, b=20, l=20, r=20)
    )
    st.plotly_chart(fig_trend, use_container_width=True)

    # Transaction Table & CSV Export
    st.subheader("📋 Transaction History & Export")
    col_search, col_filter = st.columns([3, 1])
    with col_search:
        search_query = st.text_input("Search Transactions by Title or Description", "")
    with col_filter:
        type_filter = st.selectbox("Filter Type", ["All", "income", "expense"])

    filtered_df = df.copy()
    if search_query:
        filtered_df = filtered_df[filtered_df["title"].str.contains(search_query, case=False, na=False)]
    if type_filter != "All":
        filtered_df = filtered_df[filtered_df["type"] == type_filter]

    st.dataframe(filtered_df, use_container_width=True)

    csv_data = filtered_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Download Transactions CSV",
        data=csv_data,
        file_name="finance_tracker_transactions.csv",
        mime="text/csv"
    )

# ==========================================
# TAB 2: FULL REACT WEB APPLICATION
# ==========================================
with tab_react:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_path = os.path.join(current_dir, "client", "dist")
    
    if os.path.exists(dist_path) and os.path.exists(os.path.join(dist_path, "index.html")):
        # Mount React application compiled distribution
        finance_tracker = components.declare_component("personal_finance_tracker", path=dist_path)
        finance_tracker()
    else:
        st.error(f"React production build not found at `{dist_path}`.")
        st.info("Run `cd client && npm run build` to generate the production assets.")
