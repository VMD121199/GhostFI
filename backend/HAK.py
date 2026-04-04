import asyncio
import os

from dotenv import load_dotenv
from hedera_agent_kit.langchain.toolkit import HederaLangchainToolkit
from hedera_agent_kit.plugins import (
    core_account_plugin,
    core_account_query_plugin,
    core_token_plugin,
    core_consensus_plugin,
)
from hedera_agent_kit.shared.configuration import Configuration, Context, AgentMode
from hiero_sdk_python import Client, Network, AccountId, PrivateKey
from langchain.agents import create_agent
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()