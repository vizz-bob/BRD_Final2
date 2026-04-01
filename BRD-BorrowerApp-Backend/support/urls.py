from django.urls import path
from .views import (
    CreateTicketView,
    MyTicketsView,
    TicketDetailView,
)

urlpatterns = [
    path("tickets/create/", CreateTicketView.as_view(), name="create_ticket"),
    path("my-tickets/", MyTicketsView.as_view(), name="my_tickets"),
    path("tickets/<int:pk>/", TicketDetailView.as_view(), name="ticket_detail"),
]