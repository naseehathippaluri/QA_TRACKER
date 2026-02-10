from rest_framework import generics
from .models import Feature
from .serializers import FeatureSerializer
from .permissions import IsFeatureAdminOrReadOnly


class FeatureListCreateView(generics.ListCreateAPIView):
    queryset = Feature.objects.all().select_related('created_by').order_by('name')
    serializer_class = FeatureSerializer
    permission_classes = [IsFeatureAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FeatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Feature.objects.all().select_related('created_by')
    serializer_class = FeatureSerializer
    permission_classes = [IsFeatureAdminOrReadOnly]
